const db = require('../utils/db');
const User = require('../utils/user');
const Taikhoan = require('../utils/account');
const Tranfer_history = require('../utils/tranfer_history');

function onDataHandle({ data: data }) {
    return { input: data.input, output: data.output }
}

function getModel(model) {
    let MODEL = null;
    switch (model) {
        case 'user': {
            MODEL = User;
        } break;
        case 'taikhoan': {
            MODEL = Taikhoan;
        } break;
        case 'tranfer_history': {
            MODEL = Tranfer_history;
        }
    }

    return MODEL;
}

module.exports = {

    query: async ({ data: data }) => {

        var datah = onDataHandle({ data: data });
        var input_model, output_model, output_model_str, input_data;
        var output_data = new Object();

        // trường hợp input và output chỉ chứa 1 phần tử đơn giản
        // trường hợp input có nhiều hơn 1 phần từ, cần có 1 bộ lọc dữ liệu
        for (var i in datah.input) {
            input_model = getModel(datah.input[i].model);
            input_data = datah.input[i].data;
        }

        for (var i in datah.output) {
            output_model_str = Object.keys(input_data)[0];
            output_model = getModel(datah.output[i].model);
        }


        var result = await db.find({ model: input_model, data: input_data });

        if (result && result.success == true) {
            var attribute_data = result.attribute_data;

            for (var i in attribute_data) {
                var item = attribute_data[i].toJSON();

                for (let [k, v] of Object.entries(item)) {

                    if (k.includes('id') && k.includes(output_model_str)) {
                        output_data[k] = v;
                    }
                }


            }
            if (output_data && Object.keys(output_data)[0]) {
                var result_output = await db.find({ model: output_model, data: output_data }); // khóa ngoại ở đây bị sai
                return result_output;
            } else {
                return { success: true, attribute_data: [] }
            }
        }
    },


};