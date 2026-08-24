export class Registration {
  constructor(
    public login: string,
    public email: string,
    public password: string,
    public langKey: string,
    public firstName?: string,
    public lastName?: string,
    public phone?: string,
    // NEW: id of the unlinked Attachment created by POST /account/upload-picture, if the user
    // uploaded a profile picture before submitting the form. Undefined if no picture was
    // uploaded - the backend treats a missing id as "no picture", not an error.
    public pictureAttachmentId?: number,
  ) {}
}
