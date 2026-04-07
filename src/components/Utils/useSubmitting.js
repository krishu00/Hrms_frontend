import { useState } from "react";

// hook that wraps an async action to prevent concurrent execution
export function useSubmitting() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const run = async (action) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await action();
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, run };
}
