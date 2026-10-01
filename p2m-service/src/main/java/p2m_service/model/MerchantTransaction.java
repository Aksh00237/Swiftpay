package p2m_service.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "merchant_txns")
public class MerchantTransaction {

    @Id
    private String id;

    private String userId;
    private String merchantId;
    private double amount;

    private double commission;
    private double finalAmount;

    private String status;
}