export interface EvaluationResult {
  candidateId: string;
  score: number;
}

export interface QuestionnaireService {
  triggerQ1(candidateId: string): Promise<EvaluationResult>;
  triggerQ2(candidateId: string): Promise<EvaluationResult>;
}
