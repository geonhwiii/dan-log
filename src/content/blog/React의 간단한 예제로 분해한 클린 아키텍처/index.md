---
title: '[번역] React의 간단한 예제로 분해한 클린 아키텍처'
summary: 'React의 클린 아키텍처 예제'
date: '01 04 2024'
draft: false
tags:
  - 번역
  - React
  - Clean Architecture
---

> 원문 : https://www.linkedin.com/posts/niksumeiko_reactjs-cleanarchitecture-activity-7137751469641916417-wIxv?utm_source=share&utm_medium=member_desktop

다음은 누구나 이해할 수 있는 React의 간단한 예제로 분해한 클린 아키텍처입니다.

**기본 개념**

1. 관심사(SoC)를 기능적 계층으로 분리하기
2. 어댑터 의존성 반전

이렇게 하면 다음 비즈니스 요구사항/기능을 위해 React 앱을 "쉽게 변경"할 수 있습니다. 말 그대로 새로운 소프트웨어 동작을 구현하기 위해 손을 대야 하는 곳이 줄어듭니다. 또한 클린 아키텍처를 사용하여 구축된 앱을 테스트하는 것은 매우 쉽습니다.

### 1. View Functional Layer

- 뷰가 비즈니스로직을 가지지 않는다.
- 오직 통합 코드만을 가집니다.
- 해당 모델에만 집중을 합니다.
- 모델로 결과를 렌더링하는 것에 사용합니다.

```tsx
// View functional layer
export const ValidationPage = () => {
  // view model
  const { isValidationAvailable, onChange, onSubmit, validationError, validationResult } = useIvanValidation();

  return (
    <FocusPageLayout>
      <HeroTitle title="Iban Validator" />
      <form onSubmit={onSubmit}>
        <IbanInputField error={validationError} onChange={onChange} />
      </form>
      {isValidationAvailable && <PositiveList items={validationResult} />}
    </FocusPageLayout>
  );
};
```

### 2. UseCase functional layer

- UseCase는 특정 동작이 시작되는 지점을 가지고 있습니다.
- 뷰 모델을 구성하거나 조율합니다.
- 데이터 저장소와 통신하여 필요한 데이터를 가져오거나 업데이트합니다.
- 외부 서비스를 활용할 수 있습니다.
- 비즈니스 로직이 없습니다. 주로 서비스 통합과 관련된 코드를 다룹니다.
- 주로 다른 시스템이나 서비스와의 통합을 위한 코드만을 포함하고 있습니다.

```tsx
export function useIbanValidation() {
  const [formValues, setFormValues] = useState({ iban: '' });
  const [iban, setIban] = useState(formValues.iban);
  const { data, error } = useIban(iban); // Repository

  const model = createIbanValidationViewModel(data, error); // Service

  const onSubmit = useCallback(
    (event) => {
      setIban(formValues.iban);
      event.preventDefault(); // UseCase entry point
    },
    [formValues.iban]
  );

  const onChange = useCallback((event) => {
    setFormValues({ iban: event.target.value });
  });

  // return view model
  return {
    ...model,
    onSubmit,
    onChange,
  };
}
```

### 3. Repository functional layer

- React 앱의 상태를 유지하는 `Repository`와 상호작용합니다.
- 일관된 API를 제공하여 다른 부분에서 일관된 방식으로 데이터를 사용할 수 있습니다.
- 어댑터는 데이터 페칭의 중간 매개체로 사용되며, 외부 서비스나 API와의 통신을 처리합니다.
- 어댑터로부터 언제 새로운 데이터를 얻어와야 하는지를 알아야합니다.
- 비즈니스 로직이 없습니다. 주로 서비스 통합과 관련된 코드를 다룹니다.
- 주로 다른 시스템이나 서비스와의 통합을 위한 코드만을 포함하고 있습니다.

```tsx
export function useIban(iban: string) {
  const createAdapter = () => useValidationAdapterFactory();
  const ibanValidationApiAdapter = createAdapter();

  return useQuery(['validation', iban], ibanValidationApiAdapter, {
    // Adapter
    enabled: Boolean(iban),
    retry: false,
  });
}
```

### 4. Adapter functional layer

- 어댑터는 API 요청을 생성합니다.
- 상호작용을 위해 필요한 통신 메커니즘을 얻습니다.
- API 요구 사항에 대해 인지해야 합니다.
- 비즈니스 로직을 가집니다.

```tsx
export type ValidationReponse = {
  iban: string;
  flags: ('INSTANT' | 'POSITIVE HISTORY' | 'SECURITY_CLIAMS')[];
  bank?: { trustScore?: number };
};

type AdaterOptions = { request?: typeof window.fetch };

export function createIbanValidationApiAdapter(
  iban: string,
  { request = window.fetch }: AdaterOptions = {} // communication mechanism
) {
  return async (): Promise<ValidationReponse> => {
    const response = await request(`${apiUrl}/validate?iban=${iban}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const result = await response.json();

    if (response.ok) {
      return result;
    }

    throw result;
  };
}
```

### 5. Service functional layer

- 비즈니스 로직을 담당합니다.

```ts
export function createIbanValidationViewModel(validation?: ValidationResponse, error?: unknown) {
  const validationError = getValidationError(error);

  if (!validation) {
    return {
      validationError,
      validationResults: [],
      isValidationAvailable: false,
    };
  }

  const results = ['Valid IBAN'];
  const { bank, flags } = validation;

  if (hasTrustedBank(bank)) {
    results.push('Trusted bank');
  }

  if (flags.includes('INSTANT')) {
    results.push('Accepts instant payments');
  }

  if (flags.includes('POSITIVE HISTORY')) {
    results.push('Positive operation history');
  }

  if (!flags.includes('SECURITY_CLAIMS')) {
    results.push('No Security claims');
  }

  return {
    validationError,
    validationResults: results,
  };
}
```
