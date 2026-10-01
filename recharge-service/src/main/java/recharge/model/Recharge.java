package recharge.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "recharges")
public class Recharge {

    @Id
    private String id;

    private String mobileNumber;
    private String operator;
    private double amount;

    private String status;
}