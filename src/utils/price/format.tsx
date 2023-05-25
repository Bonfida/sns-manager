const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",

  minimumFractionDigits: 2,
});

export const format = (x: number, stripDollar?: boolean) => {
  const f = formatter.format(x);
  if (stripDollar) {
    return f.replace("$", "");
  }
  return f;
};
