// Data formating
export const getFormattedDate = (date: number) => {
  const theDate = new Date(date * 1000);
  const dateString = theDate.toUTCString();
  return dateString;
};

// Fn name formating
export const getAmountOfNFTs = (functionName: string) => {
  if (functionName === "claim") {
    return 1;
  } else if (functionName === "claim-two") {
    return 2;
  } else if (functionName === "claim-three") {
    return 3;
  } else if (functionName === "claim-four") {
    return 4;
  } else if (functionName === "claim-five") {
    return 5;
  } else if (functionName === "claim-six") {
    return 6;
  } else if (functionName === "claim-seven") {
    return 7;
  } else if (functionName === "claim-eight") {
    return 8;
  } else if (functionName === "claim-nine") {
    return 9;
  } else {
    return 10;
  }
};
