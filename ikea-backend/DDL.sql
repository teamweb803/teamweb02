-- 회원
CREATE TABLE members (
    member_id       BIGSERIAL       PRIMARY KEY,
    login_id        VARCHAR(50)     NOT NULL UNIQUE,
    password        VARCHAR(100)    NOT NULL,
    name            VARCHAR(50)     NOT NULL,
    email           VARCHAR(254)    NOT NULL UNIQUE,
    phone_number    VARCHAR(20)     NOT NULL UNIQUE,
    zone_code       VARCHAR(10),
    address_main    VARCHAR(254),
    address_detail  VARCHAR(254),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    member_role     VARCHAR(20)     NOT NULL DEFAULT 'USER'
);

-- 카테고리
CREATE TABLE categories (
    category_id     BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(50)     NOT NULL UNIQUE
);

-- 상품
CREATE TABLE products (
    product_id      BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(50)     NOT NULL,
    price           INTEGER         NOT NULL,
    img_path        TEXT            NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    category_id     BIGINT          REFERENCES categories(category_id)
);

-- 장바구니
CREATE TABLE carts (
    cart_id         BIGSERIAL       PRIMARY KEY,
    member_id       BIGINT          NOT NULL UNIQUE REFERENCES members(member_id)
);

-- 장바구니 상품
CREATE TABLE cart_products (
    cart_product_id BIGSERIAL       PRIMARY KEY,
    cart_id         BIGINT          NOT NULL REFERENCES carts(cart_id),
    product_id      BIGINT          NOT NULL REFERENCES products(product_id),
    quantity        INTEGER         NOT NULL
);

-- 주문
CREATE TABLE orders (
    order_id        BIGSERIAL       PRIMARY KEY,
    order_no        VARCHAR(50)     NOT NULL UNIQUE,
    member_id       BIGINT          NOT NULL REFERENCES members(member_id),
    order_status    VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    total_price     INTEGER         NOT NULL,
    final_price     INTEGER         NOT NULL,
    address         VARCHAR(254)    NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- 주문 상품
CREATE TABLE order_items (
    order_item_id   BIGSERIAL       PRIMARY KEY,
    order_id        BIGINT          NOT NULL REFERENCES orders(order_id),
    product_id      BIGINT          NOT NULL REFERENCES products(product_id),
    quantity        INTEGER         NOT NULL,
    order_price     INTEGER         NOT NULL
);

-- 결제
CREATE TABLE payments (
    payment_id      BIGSERIAL       PRIMARY KEY,
    order_id        BIGINT          NOT NULL UNIQUE REFERENCES orders(order_id),
    member_id       BIGINT          NOT NULL REFERENCES members(member_id),
    payment_method  VARCHAR(20)     NOT NULL,
    method_no       VARCHAR(100),
    transaction_id  VARCHAR(100),
    amount          INTEGER         NOT NULL,
    payment_status  VARCHAR(20)     NOT NULL DEFAULT 'PENDING',
    response_data   TEXT,
    cancel_reason   VARCHAR(255),
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW(),
    paid_at         TIMESTAMP,
    cancelled_at    TIMESTAMP
);

-- 리뷰
CREATE TABLE reviews (
    review_id       BIGSERIAL       PRIMARY KEY,
    member_id       BIGINT          NOT NULL REFERENCES members(member_id),
    order_id        BIGINT          NOT NULL REFERENCES orders(order_id),
    product_id      BIGINT          NOT NULL REFERENCES products(product_id),
    content         TEXT            NOT NULL,
    rating          INTEGER         NOT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Q&A
CREATE TABLE qna (
    qna_id          BIGSERIAL       PRIMARY KEY,
    level           INTEGER         NOT NULL,
    parent_id       BIGINT,
    title           VARCHAR(100)    NOT NULL,
    content         TEXT            NOT NULL,
    writer          VARCHAR(50)     NOT NULL,
    view_count      INTEGER         NOT NULL DEFAULT 0,
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- Refresh Token
CREATE TABLE refresh_tokens (
    refresh_token_id    BIGSERIAL       PRIMARY KEY,
    login_id            VARCHAR(50)     NOT NULL UNIQUE,
    refresh_token       VARCHAR(255)    NOT NULL,
    member_role         VARCHAR(20)     NOT NULL
);