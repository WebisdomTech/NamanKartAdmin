import { useState, useCallback } from "react";
import { runValidationPipeline } from "@/src/shared/validation";

export function useValidationPipeline(profile: any) {
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: any[];
    warnings: any[];
    info: any[];
    autoFixes: Record<string, any>;
  }>({
    valid: true,
    errors: [],
    warnings: [],
    info: [],
    autoFixes: {},
  });

  const validate = useCallback(
    async (formData: any, options: any = {}) => {
      const res = await runValidationPipeline(formData, profile, options);
      setValidationResult(res);
      return res;
    },
    [profile]
  );

  const getFieldErrors = useCallback(
    (fieldName: string) => {
      return validationResult.errors.filter((e) => e.field === fieldName);
    },
    [validationResult.errors]
  );

  const getFieldWarnings = useCallback(
    (fieldName: string) => {
      return validationResult.warnings.filter((w) => w.field === fieldName);
    },
    [validationResult.warnings]
  );

  return {
    validationResult,
    validate,
    getFieldErrors,
    getFieldWarnings,
    isValid: validationResult.valid,
  };
}
