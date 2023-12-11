export interface Customer {
    customerIdentifier: string;
    firstName: string,
    lastName: string,
    accountNumber: string,
    creditAmount: number
}

export interface CustomerInfo {
    customerIdentifier: string;
    firstName: string,
    lastName: string,
    listOfAccounts: AccountsInfo[]
}

export interface AccountsInfo {
    accountNumberTarget: string;
    accountCreationDate: Date,
    accountValidityDate: Date,
}
