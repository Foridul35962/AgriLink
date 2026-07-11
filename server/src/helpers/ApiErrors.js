class ApiErrors extends Error {
    constructor(status, message = 'somthing is wrong', error = []) {
        super(message)
        this.status = status
        this.error = error
        this.success = false
    }
}

export default ApiErrors