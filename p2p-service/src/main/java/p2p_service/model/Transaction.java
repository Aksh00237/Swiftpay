package p2p_service.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "transactions")
public class Transaction {

    @Id
    private String id;

    private String senderId;
    private String receiverId;
    private double amount;
    private String status;
}