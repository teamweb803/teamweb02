-- orders 테이블 member_id NOT NULL 제거
ALTER TABLE orders ALTER COLUMN member_id DROP NOT NULL;

-- orders 테이블 비회원 컬럼 추가
ALTER TABLE orders ADD COLUMN guest_name VARCHAR(50);
ALTER TABLE orders ADD COLUMN guest_phone VARCHAR(20);

-- payments 테이블 member_id NOT NULL 제거
ALTER TABLE payments ALTER COLUMN member_id DROP NOT NULL;

-- product_stocks 테이블 추가
CREATE TABLE product_stocks (
    stock_id     BIGSERIAL   PRIMARY KEY,
    product_id   BIGINT      NOT NULL UNIQUE REFERENCES products(product_id),
    quantity     INTEGER     NOT NULL DEFAULT 0,
    updated_at   TIMESTAMP   NOT NULL DEFAULT NOW()
);