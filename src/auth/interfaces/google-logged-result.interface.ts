import { UserDocument } from "src/resources/users/schemas/user.schema"

export interface IGoogleLoggedResult {
    isNew: boolean
    user: UserDocument
}