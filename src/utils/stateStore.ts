const stateStore: { [key: string]: string } = {};

export const storeState = (state: string, value: string): void => {
  console.log(`Storing state: ${state} with value: ${value}`);
  stateStore[state] = value;
};

export const verifyState = (state: string): boolean => {
  const value = stateStore[state];
  console.log(`Verifying state: ${state}, found value: ${value}`);
  if (value) {
    delete stateStore[state]; // Optionally delete the state after verification
    return true;
  }
  return false;
};
