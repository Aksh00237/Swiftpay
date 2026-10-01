package recharge.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Document(collection = "recharges")
public class Recharge {

    @Id
    private String id;

    private String mobileNumber;
    private String operator;

    @Field(targetType = FieldType.DECIMAL128)
    private BigDecimal amount;

    private RechargeStatus status;
    private String failureReason;
    private Instant createdAt;
}
