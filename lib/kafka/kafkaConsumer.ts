// lib/kafka/kafkaConsumer.ts
import {Kafka} from 'kafkajs';

const kafka = new Kafka({
    clientId: 'DVerse-UI',
    brokers: [process.env.NEXT_PUBLIC_KAFKA_BOOTSTRAP_SERVER as string],
    ssl: true,
    sasl: {
        mechanism: 'plain',
        username: process.env.NEXT_PUBLIC_KAFKA_SASL_USERNAME as string,
        password: process.env.NEXT_PUBLIC_KAFKA_SASL_PASSWORD as string,
    },
});

const consumer = kafka.consumer({groupId: 'default'});

export async function startConsumer(topic: string) {
    await consumer.connect();
    await consumer.subscribe({topic, fromBeginning: true});
}

export async function stopConsumer() {
    await consumer.disconnect();
}

export async function consumeMessages(handleMessage: (message: string) => void) {
    await consumer.run({
        eachMessage: async ({topic, partition, message}) => {
            handleMessage(message.value!.toString());
        },
    });
}
