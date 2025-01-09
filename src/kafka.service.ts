import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class KafkaService implements OnModuleInit {
  private readonly kafka = new Kafka({
    clientId: 'nestjs-consumer',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
  });
  private consumer: Consumer;

  // Supabase client
  private supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || '',
  );

  async onModuleInit() {
    this.consumer = this.kafka.consumer({ groupId: 'nestjs-group' });

    // Connect to Kafka
    await this.consumer.connect();

    // Subscribe to the topic
    await this.consumer.subscribe({
      topic: process.env.KAFKA_TOPIC || 'plant_data',
      fromBeginning: true,
    });

    // Consume messages
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value.toString());
        console.log(
          `[${topic} | Partition ${partition}] Received message:`,
          data,
        );

        // Save the data to Supabase
        await this.saveToSupabase(data);
      },
    });
  }

  // Save or update data in Supabase
  private async saveToSupabase(data: {
    name: string;
    moisture_pct: number;
    status_msg: string;
  }) {
    const { error } = await this.supabase.from('moisture_data').upsert(
      {
        name: data.name, // Match based on the 'name' column
        moisture_pct: data.moisture_pct,
        status_msg: data.status_msg,
      },
      { onConflict: 'name' }, // Specify the column to check for conflict
    );

    if (error) {
      console.error('Error saving to Supabase:', error.message);
    } else {
      console.log('Data successfully saved or updated in Supabase:', data);
    }
  }
}
