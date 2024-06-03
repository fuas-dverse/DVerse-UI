import {Kafka} from "kafkajs";

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

export const kafkaProducer = kafka.producer({
    allowAutoTopicCreation: false,
});

