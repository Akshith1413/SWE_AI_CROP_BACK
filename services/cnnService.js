import axios from "axios";
import FormData from "form-data";

export const predictDisease = async (fileBuffer, filename) => {
  const form = new FormData();

  form.append("file", fileBuffer, filename);

  const response = await axios.post(
    "http://127.0.0.1:5001/predict",
    form,
    {
      headers: form.getHeaders(),
    }
  );

  return response.data;
};
