import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'nestjs-consumer',
      brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
    });
  }

  async onModuleInit() {
    let connected = false;
    let retries = 5;
    while (!connected && retries > 0) {
      try {
        this.consumer = this.kafka.consumer({ groupId: 'nestjs-group' });
        await this.consumer.connect();
        connected = true;
      } catch (error) {
        console.error(
          `Kafka connection failed. Retrying... (${retries})`,
          error.message,
        );
        retries--;
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
      }
    }

    if (!connected) {
      throw new Error('Failed to connect to Kafka after multiple attempts.');
    }

    // Subscribe to topic
    await this.consumer.subscribe({
      topic: process.env.KAFKA_TOPIC || 'plant_data',
      fromBeginning: true,
    });
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const data = JSON.parse(message.value.toString());
        console.log(
          `[${topic} | Partition ${partition}] Received message:`,
          data,
        );
      },
    });
  }
}
