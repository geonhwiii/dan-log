---
title: "서버에서 관리하는 formData"
summary: "서버에서 관리하는 formData (feat. react-hook-form)"
date: "11 10 2024"
draft: false
tags:
  - React
---

## 1. react-hook-form

`react-hook-form`의 기본적인 사용법은 다음과 같습니다.

```tsx
export function ReactHookFormTemplate(children: Children) {
	const method = useForm({
	    mode: 'onSubmit',
		defaultValues: ... // 초기 기본값이 들어갈 부분
		resolver: ... // validation을 위한 resolver가 들어갈 부분
	});
	const onSubmit = () => {
	  // ...formData 전달
	}
	return (
	<FormProvider {...method}>
		<form onSubmit={method.handleSubmit(onSubmit)}>
			{children}
		</form>
	</FormProvider>
	)
}
```

여기서 `defaultValues`는 `useForm`이 실행될 때 설정되며, 이후에 변경되는 값은 `setValue`로 변경해야합니다. 즉, `API`로 받아온 `Data`를 기본값으로 사용하려면 렌더링 이전에 보장된 `Data`가 전달되어야 합니다.

따라서, `ServerSideRendering`을 통해 `Hydration`으로 구현하거나, `Suspense`를 통해 데이터를 보장하는 방법이 있습니다.

```tsx
export function SuspenseWrapper() {
	return (
		<Suspense fallback={<Loading />}>
			<ReactHookFormTemplate />
		</Suspense>
	)
}

export function ReactHookFormTemplate() {
	const { data } = useQuery({
		queryFn: () => api(),
		suspense: true // suspense
	})
	const method = useForm({
		defaultValues: data.content // 성공한 data를 defaultValues에 넣음
	});

	...
}

```

## 2. 서버에서 formData 다루기

위처럼 api 요청에 대한 응답을 `defaultValues`로 넣었습니다.

그럼 서버의 응답을 `formData`로 사용한다는 의미인데, 어떻게 효율적으로 사용할 수 있을까요?

스펙터는 평판 작성 질문들을 다루는 서비스다 보니 `formId`만 20개가 넘게 들어갑니다.

각 질문별 ID, 질문, 옵션, 답변, 각각의 `validation`을 모두 관리해야하죠.

이전의 `formData`는 모두 클라이언트가 관리하였는데요, 아래와 같습니다.

```tsx
export enum TEMPLATE_FORM_ID {
	지원자명 = '지원자명',
	작성자명 = '작성자명',
	지원자_번호 = '지원자_번호',
	작성자_번호 = '작성자_번호',
	...
    ...
    기타정보 = '기타정보'
}

export enum TEMPLATE_FORM_QUESTION {
	객관식_1 = 'question1',
	객관식_2 = 'question2',
	객관식_3 = 'question3',
	...,
	객관식_15 = 'quesiton15'
}
```

위 방식이 잘못된 것은 아니지만,

요구사항에 따라 자유롭게 변경할 수 없고,

`formData`가 변경되면 클라이언트를 수정 및 배포를 매번 해주어야하는 불편함이 있습니다.

그래서 이번에는 프론트엔드와 백엔드가 같이 구조를 설계하고 아래와 같이 API 응답을 만들었습니다.

```tsx
type QuestionResult = {
  // 질문
  question: Record<string, object>;
  // 임시저장된 응답
  answer: Record<string, string>;
  // 질문의 각 validation을 담당
  validation: Record<string, object>[];
};
```

위와 같이 응답을 설계하고, `useForm`에 그대로 사용합니다.

```tsx
const { data: { answer, validation } } = useQuery();

// 설계한 validation을 zodSchema로 변환
const schema = useCreateValidationSchema(validation);

const method = useForm({
	mode: 'onSubmit',
	resolver: zodResolver(schema),
	defaultValues: {
		// 임시저장된 데이터를 그대로 전달
		...answer,
	},
});
...
```

schema 변환은 간단하게 보여드리면,

```tsx
// validation을 zodSchema로 변환합니다.
export const useCreateValidationSchema = (
	validations: Validation[],
) => {
	const schema = z.object(
		validations.reduce((acc, validation) => {
			acc[validation.id] = createValidationSchema(validation);
			return acc;
		}, {} as Record<string, z.ZodType<any>>),
	);
	return schema;
};


// ts-pattern을 이용해서 type에 따라 validation schema를 설정합니다
// type, message, nullable도 서버에서 받은 응답으로 처리합니다.
const createValidationSchema = ({
	type,
	message,
	nullable,
}: Validation) => {
	const schema = match(type)
		.with('select', () => z.string({ message }).min(1, { message }))
		.with('radio', () => z.string({ message }).min(1, { message }))
		.with('text', () => z.string({ message }))
		...
	),
)
```

마지막으로 `question`을 이용하여 컴포넌트를 렌더링하고, `formId`를 주입합니다.

```tsx
function QuestionComponent({ question }: Props) {
	const { control, formState: { errors } } = useFormContext();
	const result = createQuestionToMap(question); // object -> Map
	const items = Object.entries(result); // Map -> List

	return (
		<div>
			{items.map(({ id, question, subLabel, options }) => (
				<LabelGroup
					key={id}
					label={question}
					subLabel={subLabel}
					errorMessage={errors[id]?.message}
				>
					<RadioGroup
						id={id}
						options={options}
						control={control}
					/>
				</LabelGrup>
			)}
		</div>
	)
}
```

위처럼 API 응답에서 오는 데이터를 `formData`로 그대로 활용하여 페이지를 구성함으로써

프론트엔드는 `formId`, `질문`, `답변`, `validation` 등의 관리에서 벗어나고,

비즈니스 요구사항의 변경에 한결 더 자유로워 질 수 있었습니다.

---

화면이 없다보니 설명이 조금 부족했을 수 있지만,

중요한 것은 프론트엔드와 백엔드간의 소통을 통한 `formData` 설계라고 생각합니다.

긴 글 읽어주셔서 감사합니다 :)
