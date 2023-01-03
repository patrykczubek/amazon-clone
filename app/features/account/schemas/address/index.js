import * as Yup from 'yup'

const phoneRegExp = /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/

export const validationSchema = Yup.object().shape({
  name: Yup.string().required("Full name is required"),
  phoneNumber: Yup.string().required("Phone number is required").matches(phoneRegExp, 'Phone number is not valid').min(10, "too short").max(10, "too long"),
  line1: Yup.string().required("Address is required"),
  line2: Yup.string(),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
  zip: Yup.string().required("Zip is required"),
  country: Yup.string().required("Country is required"),
  billingSameAsShipping: Yup.boolean(),
  defaultAddress: Yup.boolean(),
  billingAddress: Yup.object().when("billingSameAsShipping", {
    is: false,
    then: Yup.object().shape({
      line1: Yup.string().required("Billing address is required"),
      line2: Yup.string(),
      city: Yup.string().required("Billing city is required"),
      state: Yup.string().required("Billing state is required"),
      zip: Yup.string().required("Billing zip is required"),
      country: Yup.string().required("Billing country is required"),
    })
  })
})

export const shippingAddressFormFields = {
  name: {
    name: "Your name",
    type: "text"
  },
  phoneNumber: {
    name: "Phone Number",
    type: "text"
  },
  line1: {
    name: "Address line 1",
    type: "text"
  },
  line2: {
    name: "Address line 2",
    type: "text"
  },
  city: {
    name: "City",
    type: "text"
  },
  state: {
    name: "State",
    type: "text"
  },
  zip: {
    name: "Zip code",
    type: "text"
  },
  country: {
    name: "Country",
    type: "text"
  }
}

export const billingAddressFormFields = {
  line1: {
    name: "Address line 1",
    type: "text"
  },
  line2: {
    name: "Address line 2",
    type: "text"
  },
  city: {
    name: "City",
    type: "text"
  },
  state: {
    name: "State",
    type: "text"
  },
  zip: {
    name: "Zip code",
    type: "text"
  },
  country: {
    name: "Country",
    type: "text"
  }
}

export const deliveryInstructionsSchema = Yup.object().shape({
  propertyType: Yup.string(),
  location: Yup.string(),
  instructions: Yup.string(),
  securitycode: Yup.string()
})