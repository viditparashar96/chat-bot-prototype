import axios from "axios";

export const sendToClinic = async ({
  formData,
  insuranceIDurl,
  govtIDurl,
}: any) => {
  try {
    console.log("Sending to clinic...");
    console.log("Form Data:", formData);
    console.log("Insurance ID URL:", insuranceIDurl);
    console.log("Government ID URL:", govtIDurl);

    const response = await axios.post("/api/send-to-clinic", {
      formdata: formData,
      insuranceIDurl,
      govtIDurl,
    });

    const data = await response.data;
    console.log("Clinic response:", data);
    return data;
  } catch (error) {
    console.error(error);
  }
};
