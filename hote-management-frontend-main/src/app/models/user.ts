export class User {
    constructor(
        public _id?: string,
        public username?: string,
        public password?: string,
        public email?: string,
        public name?: string,
        public lastname?: string,
        public role?: string,
        public reservations?: [],
        public invoices?: [],
        public hoted_hotels_id?: []
    ){}
}