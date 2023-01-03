import * as Yup from 'yup'

export const listCreateSchema = Yup.object().shape({
  name: Yup.string().required("List name is required").min(3, "List name must be at least 3 characters")
})

export const itemListEditSchema = Yup.object().shape({
  comment: Yup.string(),
  priority: Yup.number(),
  itemsNeeded: Yup.number(),
  itemsHave: Yup.number()
})

export const addUserSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  permission: Yup.boolean()
})

export const addIdeaSchema = Yup.object().shape({
  idea: Yup.string().required("Idea is required")
})