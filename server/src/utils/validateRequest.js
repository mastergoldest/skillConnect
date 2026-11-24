
export const validateRequest = (schema, data) => {
  const result = schema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    data: result.data,
  };
};
