import {Kafka} from "kafkajs";

const kafka = new Kafka({
    clientId: 'DVerse-UI',
    brokers: [process.env.KAFKA_BOOTSTRAP_SERVER as string],
    ssl: true,
    sasl: {
        mechanism: 'plain',
        username: process.env.KAFKA_SASL_USERNAME as string,
        password: process.env.KAFKA_SASL_PASSWORD as string,
    },
});

export const kafkaProducer = kafka.producer({
    allowAutoTopicCreation: false,
});

