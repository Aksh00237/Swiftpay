package p2m_service.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "merchants")
public class Merchant {

    @Id
    private String id;

    private double balance;
}