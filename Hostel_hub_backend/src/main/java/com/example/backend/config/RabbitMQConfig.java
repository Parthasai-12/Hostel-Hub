package com.example.backend.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class RabbitMQConfig {

    public static final String QUEUE_NAME = "email.queue";
    public static final String DLQ_NAME = "email.dlq";
    public static final String EXCHANGE_NAME = "email.exchange";
    public static final String DLX_NAME = "email.dlx";
    public static final String ROUTING_KEY = "email.routing.key";
    public static final String DLQ_ROUTING_KEY = "email.dlq.routing.key";

    @Bean
    public Queue emailQueue() {
        Map<String, Object> arguments = new HashMap<>();
        arguments.put("x-dead-letter-exchange", DLX_NAME);
        arguments.put("x-dead-letter-routing-key", DLQ_ROUTING_KEY);
        return QueueBuilder.durable(QUEUE_NAME)
                .withArguments(arguments)
                .build();
    }

    @Bean
    public Queue emailDlq() {
        return QueueBuilder.durable(DLQ_NAME).build();
    }

    @Bean
    public DirectExchange emailExchange() {
        return new DirectExchange(EXCHANGE_NAME);
    }

    @Bean
    public DirectExchange emailDlx() {
        return new DirectExchange(DLX_NAME);
    }

    @Bean
    public Binding emailBinding(Queue emailQueue, DirectExchange emailExchange) {
        return BindingBuilder.bind(emailQueue).to(emailExchange).with(ROUTING_KEY);
    }

    @Bean
    public Binding dlqBinding(Queue emailDlq, DirectExchange emailDlx) {
        return BindingBuilder.bind(emailDlq).to(emailDlx).with(DLQ_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        return new RabbitAdmin(connectionFactory);
    }

    @Bean
    public org.springframework.amqp.rabbit.retry.MessageRecoverer messageRecoverer(RabbitTemplate rabbitTemplate) {
        return new org.springframework.amqp.rabbit.retry.RepublishMessageRecoverer(rabbitTemplate, DLX_NAME, DLQ_ROUTING_KEY) {
            private final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger("DLQ-Logger");
            
            @Override
            public void recover(org.springframework.amqp.core.Message message, Throwable cause) {
                logger.warn("[DLQ] Message processing failed after retries. Routing to DLQ. Payload: {}, Reason: {}", 
                    new String(message.getBody(), java.nio.charset.StandardCharsets.UTF_8), cause.getMessage());
                super.recover(message, cause);
            }
            
            @Override
            protected Map<String, Object> additionalHeaders(org.springframework.amqp.core.Message message, Throwable cause) {
                Map<String, Object> headers = new HashMap<>();
                headers.put("x-failed-timestamp", System.currentTimeMillis());
                return headers;
            }
        };
    }
}
