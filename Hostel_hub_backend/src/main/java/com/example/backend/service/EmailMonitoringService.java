package com.example.backend.service;

import com.example.backend.config.RabbitMQConfig;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.GetResponse;
import org.springframework.amqp.rabbit.connection.Connection;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;

@Service
public class EmailMonitoringService {

    @Autowired
    private ConnectionFactory connectionFactory;

    @Autowired
    private RabbitAdmin rabbitAdmin;

    /**
     * Get the count of failed messages in the Dead Letter Queue.
     */
    public int getFailedEmailCount() {
        Properties props = rabbitAdmin.getQueueProperties(RabbitMQConfig.DLQ_NAME);
        if (props != null) {
            Object countObj = props.get(RabbitAdmin.QUEUE_MESSAGE_COUNT);
            if (countObj instanceof Number) {
                return ((Number) countObj).intValue();
            }
        }
        return 0;
    }

    /**
     * Peek at the entries in the Dead Letter Queue without destroying/consuming them.
     */
    public List<String> getDeadLetterQueueEntries(int limit) {
        List<String> entries = new ArrayList<>();
        Connection connection = connectionFactory.createConnection();
        Channel channel = connection.createChannel(false);
        try {
            for (int i = 0; i < limit; i++) {
                GetResponse response = channel.basicGet(RabbitMQConfig.DLQ_NAME, false);
                if (response == null) {
                    break;
                }
                
                byte[] body = response.getBody();
                String json = new String(body, StandardCharsets.UTF_8);
                entries.add(json);
                
                // Reject with requeue=true so that messages return to the queue and are not deleted.
                channel.basicReject(response.getEnvelope().getDeliveryTag(), true);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to read messages from DLQ", e);
        } finally {
            try {
                if (channel != null && channel.isOpen()) {
                    channel.close();
                }
                if (connection != null && connection.isOpen()) {
                    connection.close();
                }
            } catch (Exception e) {
                // Ignore closing exceptions
            }
        }
        return entries;
    }
}
