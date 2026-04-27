from pydantic import BaseModel, ConfigDict, Field, EmailStr

class FormSubmission(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    site: str = Field(description="Site of origin for database selection")
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    message: str = Field(min_length=10, max_length=5000)
    organization: str | None = None
    turnstile_token: str = Field(alias="cf-turnstile-response")
    form_type: str = "contact"

class SubmissionResponse(BaseModel):
    id: str
    status: str = "submitted"
    message: str = "Form submitted successfully"

class SubmissionListItem(BaseModel):
    id: str = Field(alias="_id")
    name: str
    email: EmailStr
    organization: str | None = None
    submitted_at: str = Field(alias="submittedAt")
    status: str
    form_type: str = Field(default="contact", alias="formType")
    site: str | None = None