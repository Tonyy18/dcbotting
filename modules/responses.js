

const create_response = (res, code, content) => {
    res.status(code)
    res.json({
        code: code,
        message: content
    })
    return res;
}
exports.ok = (res, text) => {
    return create_response(res, 200, text == null ? "Ok" : text)
}
exports.created = (res, text) => {
    return create_response(res, 201, text == null ? "Created" : text)
}
exports.bad_request = (res, text) => {
    return create_response(res, 400, text == null ? "Bad Request" : text)
}
exports.unauthorized = (res, text) => {
    return create_response(res, 401, text == null ? "Unauthorized" : text)
}
exports.forbidden = (res, text) => {
    return create_response(res, 403, text == null ? "Forbidden" : text)
}
exports.not_found = (res, text) => {
    return create_response(res, 404, text == null ? "Not Found" : text)
}