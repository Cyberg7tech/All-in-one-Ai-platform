// cspell:ignore intfloat
export const TOGETHER_BASE = process.env.TOGETHER_BASE_URL ?? 'https://api.together.xyz/v1';

function requireKey(): string {
	const key = process.env.TOGETHER_API_KEY;
	if (!key) {
		throw new Error('TOGETHER_API_KEY is not configured');
	}
	return key;
}

export async function togetherChat(opts: {
	model: string;
	messages: { role: 'system' | 'user' | 'assistant'; content: string }[];
	temperature?: number;
	max_tokens?: number;
	stream?: boolean;
}): Promise<any> {
	const res = await fetch(`${TOGETHER_BASE}/chat/completions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${requireKey()}`,
		},
		body: JSON.stringify(opts),
	});
	if (!res.ok) {
		throw new Error(`Together chat failed: ${res.status} ${await res.text()}`);
	}
	return res.json();
}

export async function togetherEmbeddings(
	input: string | string[],
	model = 'intfloat/multilingual-e5-large-instruct'
) {
	const res = await fetch(`${TOGETHER_BASE}/embeddings`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${requireKey()}`,
		},
		body: JSON.stringify({ model, input }),
	});
	if (!res.ok) {
		throw new Error(`Together embeddings failed: ${res.status} ${await res.text()}`);
	}
	return res.json();
}
