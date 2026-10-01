package p2m_service.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Document(collection = "merchant_txns")
public class MerchantTransaction {

    @Id
    private String id;

    private String userId;
    private String merchantId;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal amount;

    // Platform fee, recorded per transaction (platform revenue = sum of commission over SUCCESS txns)
    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal commission;

    // Amount credited to the merchant (amount - commission)
    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal finalAmount;

    private TransactionStatus status;
    private String failureReason;
    private Instant createdAt;
}
