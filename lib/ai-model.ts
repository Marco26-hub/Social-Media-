export function isVisionModel(model: string): boolean {
  return /gemini|gpt-4o|gpt-4-vision|claude-3|claude-sonnet|claude-opus|-vl\b|llava|vision|pixtral|llama-3\.2-\d+b-vision/i.test(model)
}

export function isFreeOpenRouterModel(model: string): boolean {
  return model.trim().toLowerCase().endsWith(':free')
}
