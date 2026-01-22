---
title: "React 컴포넌트 추상화: 좋은 설계를 위한 기준"
summary: "추상화를 어떻게 설계해야 하는지, 좋은 추상화의 기준과 실용적인 예시를 통해 효과적인 UI 컴포넌트 설계 방법을 안내합니다."
date: "01 22 2026"
draft: false
image: https://i.imgur.com/oMNXec3.png
tags:
  - React
---

![](https://i.imgur.com/oMNXec3.png)

> "이 컴포넌트, 어디까지 분리해야 하지?"

React로 개발하다 보면 자주 마주치는 고민입니다. 너무 잘게 쪼개면 파일만 늘어나고, 너무 뭉쳐두면 재사용이 어려워집니다. 결국 추상화의 기준이 없으면 매번 감에 의존하게 됩니다.

이 글에서는 컴포넌트 추상화를 판단할 수 있는 다섯 가지 기준을 소개합니다. 각 기준마다 나쁜 예시와 좋은 예시를 비교하며, 실제 설계에 적용할 수 있는 핵심 질문들을 정리했습니다.

---

## 1. UI와 코드의 1:1 대응

좋은 컴포넌트 설계의 첫 번째 기준은 **코드를 보고 화면을 떠올릴 수 있는가**입니다.

### ⚠️ 나쁜 예시

```tsx
<FAQAccordion items={faqItems} />
```

이 코드만 보고는 화면에 무엇이 보이는지 알기 어렵습니다.

어떤 항목들이 있는지, 각 항목의 내용이 무엇인지 `faqItems` 데이터와 `FAQAccordion` 내부 구현을 봐야 알 수 있습니다.

### ✅ 좋은 예시

```tsx
<Accordion defaultValue="shipping">
  <Accordion.Item value="shipping">
    <Accordion.Trigger>배송은 얼마나 걸리나요?</Accordion.Trigger>
    <Accordion.Content>평균 2-3일 내에 배송됩니다.</Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="return">
    <Accordion.Trigger>반품은 어떻게 하나요?</Accordion.Trigger>
    <Accordion.Content>7일 이내에 고객센터로 연락주세요.</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

코드 구조가 실제 UI 구조와 일치합니다. 아코디언 항목이 두 개 있고, 각각의 질문과 답변이 무엇인지 바로 알 수 있습니다.

### 핵심 질문

- 코드를 보고 화면을 떠올릴 수 있는가?
- 화면의 특정 부분을 코드에서 쉽게 찾을 수 있는가?

---

## 2. Props는 인터페이스다, 데이터 통로가 아니다

`Props`는 컴포넌트의 **공개 API**입니다. 단순히 데이터를 전달하는 통로가 아니라, 컴포넌트가 무엇을 하는지 설명하는 계약이어야 합니다.

```tsx
<??? checked={isChecked} onCheckedChange={handleCheckedChange} />
```

**props**만 보고도 "체크 가능한 무언가"라는 것을 알 수 있습니다. `Checkbox`, `Toggle`, `SelectableItem` 등의 컴포넌트 이름을 예측할 수 있습니다.

### ⚠️ 나쁜 예시

```tsx
<CartItem
  productId={item.product.id}
  productName={item.product.name}
  productImage={item.product.imageUrl}
  originalPrice={item.product.price}
  discountRate={item.product.discountRate}
  quantity={item.quantity}
  isChecked={item.isChecked}
/>
```

컴포넌트 이름은 `CartItem`인데, props는 `productId`, `originalPrice`, `discountRate`, `isChecked`입니다. **props 이름들을 보고 "이건 장바구니 아이템이겠구나"라고 예측하기 어렵습니다.** props가 그저 내부로 데이터를 전달하는 통로로만 쓰이고 있습니다.

### ✅ 좋은 예시

```tsx
<CartItem
  item={item}
  onQuantityChange={handleQuantityChange}
  onRemove={handleRemove}
/>
```

props가 컴포넌트의 역할을 설명합니다.

- `item`: 장바구니 아이템 데이터
- `onQuantityChange`: 수량 변경 가능
- `onRemove`: 삭제 가능

props만 보고도 "장바구니 아이템을 보여주고, 수량 변경과 삭제가 가능한 컴포넌트"라는 것을 알 수 있습니다.

### 핵심 질문

- 컴포넌트 이름으로부터 props 이름을 예측할 수 있는가?
- props 이름으로부터 컴포넌트 이름을 예측할 수 있는가?

---

## 3. 보폭의 일관성

**보폭**이란 이름과 props가 **같은 추상화 레벨**에서 말하고 있는가를 의미합니다.

### 좋은 레퍼런스: HTML

HTML에서 제공하는 컴포넌트를 보며 한 번 생각을 해볼까요?

```tsx
<dialog open={isOpen} onClose={handleClose} />
//       └─ 열렸는지    └─ 닫을 때

<input value={text} onChange={handleChange} />
//     └─ 값         └─ 변할 때
```

이름이 **행위/역할**을 말하고, props도 그 행위에 필요한 것만 있습니다.

**컴포넌트 이름과 props가 같은 언어로 말합니다.** 이것이 보폭이 좁은(일관된) 상태입니다.

### ⚠️ 보폭이 넓은 예시 (나쁜 예시)

```tsx
<ImageUploader
  s3Bucket={bucket}
  presignedUrl={url}
  maxFileSizeMB={10}
  allowedMimeTypes={["image/png", "image/jpeg"]}
/>
// "이미지를 올린다"는 개념인데, props는 S3, presigned URL 등 구현 세부사항
```

이름은 "이미지 업로더"라는 행위를 말하는데, props는 구현 방식(S3, presigned URL)을 말하고 있습니다. 이것이 보폭이 넓은(불일관한) 상태입니다.

### ✅ 보폭이 좁은 예시 (좋은 예시)

```tsx
<ImageUploader value={images} onChange={setImages} maxCount={5} />
// "이미지를 올린다" → value, onChange, maxCount (업로드에 필요한 것)
```

이름과 props가 같은 레벨에서 "이미지 업로드"에 대해 말하고 있습니다.

### 컴포넌트 간에도 적용됩니다

한 컴포넌트 내에서 다른 컴포넌트들을 조합할 때도 보폭이 일관되어야 합니다.

```tsx
// 나쁜 예시: 보폭이 섞임
function BookStorePage() {
  return (
    <>
      {/* 큰 보폭: "헤더"라는 개념 */}
      <Header title="서점" />

      {/* 작은 보폭: div, className, map... 구현 세부사항 */}
      <div className="grid grid-cols-3 gap-4">
        {books.map((book) => (
          <div key={book.id} className="border p-4 rounded shadow">
            <img src={book.coverUrl} alt={book.title} className="w-full" />
            <h3 className="font-bold mt-2">{book.title}</h3>
            <p className="text-gray-600">{book.author}</p>
            <p className="text-blue-600 font-bold">{book.price}원</p>
          </div>
        ))}
      </div>

      {/* 큰 보폭: "푸터"라는 개념 */}
      <Footer />
    </>
  );
}
```

```tsx
// 좋은 예시: 보폭이 일관됨
function BookStorePage() {
  return (
    <>
      <Header title="서점" />
      <BookList books={books} />
      <Footer />
    </>
  );
}
// 모두 "개념 단위"로 일관되게 표현됩니다.
```

### 핵심 질문

- 컴포넌트 이름과 props가 같은 추상화 레벨에서 말하고 있는가?
- 한 컴포넌트 내의 모든 요소가 같은 보폭인가?
- HTML 요소를 레퍼런스로 삼았을 때, 이 컴포넌트의 props는 자연스러운가?

---

## 4. 안에서 밖으로: 구현에서 추상화로

추상화를 설계할 때는 **먼저 내부 구현을 작성하고, 그 다음 본질을 찾아 추상화**하는 것이 효과적입니다.

### 과정

1. **펼치기**: 먼저 모든 구현을 한 곳에 작성합니다
2. **본질 찾기**: 이 코드가 하는 일의 본질이 무엇인지 파악합니다
3. **추상화**: 본질만 드러나도록 인터페이스를 설계합니다

### 예시: 가격 입력 필드

**1단계 - 펼치기**

```tsx
<input
  type="text"
  value={price ? price.toLocaleString() : ""}
  onChange={(e) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");
    setPrice(numericValue ? Number(numericValue) : 0);
  }}
  placeholder="가격을 입력하세요"
/>
```

**2단계 - 본질 찾기**

이 코드의 본질은 "숫자(가격)를 입력받는 것"입니다. 콤마 포맷팅, 문자열 변환, 정규식 처리는 구현 세부사항입니다.

**3단계 - 추상화**

```tsx
<PriceInput value={price} onChange={setPrice} placeholder="가격을 입력하세요" />
```

외부에서는 숫자만 다루고, 포맷팅과 변환 로직은 내부에 숨깁니다.

### 핵심 질문

- 구현을 먼저 작성하고 본질을 찾았는가?
- 외부에 드러난 인터페이스가 본질만 표현하고 있는가?

---

## 5. 과한 추상화 경계하기

추상화는 **숨기는 것**이 아니라 **드러내야 할 것을 선택하는 것**입니다.

### ⚠️ 나쁜 예시: 모든 것을 숨김

```tsx
<DynamicForm schema={formSchema} onSubmit={handleSubmit} />
```

폼에 어떤 필드가 있는지, 어떤 검증이 있는지 전혀 알 수 없습니다.

### ✅ 좋은 예시: 필요한 것만 드러냄

```tsx
<Form onSubmit={handleSubmit}>
  <Form.Field name="email" label="이메일" type="email" required />
  <Form.Field name="password" label="비밀번호" type="password" required />
  <Form.Submit>로그인</Form.Submit>
</Form>
```

폼의 구조가 드러나면서도, 각 필드의 내부 구현은 숨겨져 있습니다.

### 핵심 질문

- 이 추상화가 정말 필요한가?
- 숨긴 것이 이해를 돕는가, 방해하는가?
- 드러내야 할 것을 숨기고 있지 않은가?

---

## 정리: 좋은 추상화의 체크리스트

1. **UI와 코드가 1:1로 대응되는가?**

2. **Props가 인터페이스로서 의미가 있는가?**

3. **추상화 수준이 일관되는가?**

4. **본질에 집중하고 있는가?**

5. **과하게 숨기고 있지 않은가?**

> 추상화는 **무엇을 드러내고 무엇을 숨길 것인가**에 대한 의사결정입니다.
>
> 그리고 그 기준은 **코드를 읽는 사람이 의도를 쉽게 파악할 수 있는가**입니다.
