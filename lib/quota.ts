export const DAILY_MESSAGE_LIMIT = 20;
export const DAILY_LIMIT_MARKER = "DAILY_LIMIT_REACHED";

// Precio de gpt-oss-120b en Cerebras, por millón de tokens (ver
// cerebras.ai/pricing — actualizar si cambian).
const INPUT_COST_PER_MILLION_USD = 0.25;
const OUTPUT_COST_PER_MILLION_USD = 0.69;

export function estimateCostUsd(inputTokens: number, outputTokens: number): number {
  return (
    (inputTokens * INPUT_COST_PER_MILLION_USD +
      outputTokens * OUTPUT_COST_PER_MILLION_USD) /
    1_000_000
  );
}
