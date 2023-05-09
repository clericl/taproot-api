function isValidRequest(latitude: any, longitude: any) {
  return (!isNaN(Number(latitude)) && !isNaN(Number(longitude)));
};

export default isValidRequest;
