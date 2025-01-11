import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

@Injectable()
export class KafkaService implements OnModuleInit {
  private kafka: Kafka;
  private consumer: Consumer;
  private supabase: SupabaseClient;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'nestjs-consumer',
      brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
    });

    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || '',
    );
  }

  async onModuleInit() {
    console.log('[KafkaService] Initializing Kafka consumer...');
    this.consumer = this.kafka.consumer({ groupId: 'nestjs-group' });

    try {
      await this.consumer.connect();
      console.log('[KafkaService] Connected to Kafka successfully.');

      // Subscribe to the topic
      const topic = process.env.KAFKA_TOPIC || 'plant_data';
      await this.consumer.subscribe({ topic, fromBeginning: true });
      console.log(`[KafkaService] Subscribed to topic: ${topic}`);

      // Start consuming messages
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          const messageValue = message.value?.toString();
          console.log(
            `[KafkaService] Message received on topic "${topic}" from partition ${partition}: ${messageValue}`,
          );

          if (messageValue) {
            try {
              const parsedMessage = JSON.parse(messageValue);

              console.log('[KafkaService] Parsed message:', parsedMessage);

              // Insert data into Supabase
              console.log(
                '[KafkaService] Attempting to insert data into Supabase...',
              );
              const { error } = await this.supabase.from('plant_table').insert([
                {
                  name: parsedMessage.name,
                  moisture_pct: parsedMessage.moisture_pct,
                  status_msg: parsedMessage.status_msg,
                },
              ]);

              if (error) {
                console.error(
                  '[KafkaService] Error inserting data into Supabase:',
                  error.message,
                );
              } else {
                console.log(
                  '[KafkaService] Data inserted into Supabase successfully.',
                );
              }
            } catch (err) {
              console.error(
                '[KafkaService] Error processing message:',
                err.message,
              );
            }
          } else {
            console.warn(
              '[KafkaService] Received empty or null message value.',
            );
          }
        },
      });
    } catch (err) {
      console.error(
        '[KafkaService] Failed to initialize Kafka consumer:',
        err.message,
      );
    }
  }
}
