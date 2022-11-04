

const create_response = (res, code, content, type) => {
    if(type == null) {
        res.sendStatus(code);
        return;
    }
    res.status(code)
    if(type=="json") {
        res.json({
            code: code,
            message: content
        })
        return res;
    }
}
exports.ok = (res, text, type="json") => {
    return create_response(res, 200, text == null ? "Ok" : text, type)
}
exports.created = (res, text, type="json") => {
    return create_response(res, 201, text == null ? "Created" : text, type)
}
exports.bad_request = (res, text, type="json") => {
    return create_response(res, 400, text == null ? "Bad Request" : text, type)
}
exports.unauthorized = (res, text, type="json") => {
    return create_response(res, 401, text == null ? "Unauthorized" : text, type)
}
exports.forbidden = (res, text, type="json") => {
    return create_response(res, 403, text == null ? "Forbidden" : text, type)
}
exports.not_found = (res, text, type="json") => {
    return create_response(res, 404, text == null ? "Not Found" : text, type)
}