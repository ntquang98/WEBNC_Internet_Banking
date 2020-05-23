/* eslint-disable vars-on-top */
const db = require('../utils/db');
const User = require('../utils/user');
const Account = require('../utils/account');
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
        case 'account': {
            MODEL = Account;
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
        var output_data = [];

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

                    //tìm khoái ngoại của 2 bảng

                    if (k.includes('_id')) {
                        var obj = new Object();
                        obj[k] = v
                        output_data.push(obj)
                    }
                }
            }

            if (output_data && output_data.length > 0) {
                for (var i in output_data) {
                    try {
                        var result_output = await db.find({ model: output_model, data: output_data[i] }); // khóa ngoại ở đây bị sai
                        if (result_output &&
                            result_output.success == true &&
                            result_output.attribute_data &&
                            result_output.attribute_data.length > 0) {
                            return result_output;
                        }
                    } catch (error) {
                        continue;
                    }
                }
            } else {
                return { success: false, attribute_data: [] }
            }
        }
    },

    transfer: async ({ data: data }) => {
        let model = 'account';
        let mod = getModel(model);
        let data_input = data.input[0]
        let data_output = data.output[0]
        /* 
        - find taikhoan bằng account_number trong input
        - Nếu thành công => thực hiện bước tiếp theo. ngược lại dừng
        - lấy số tiền dự định account_value trong input
        - find taikhoan bằng account_number trong output
        - update taikhoan đó bằng account_value  trong input
        - nếu update thành công thực hiện bước tiếp theo. ngược lại dừng
        - update lại taikhoan có account_number input
        */
        let account_input = await db.find({ model: mod, data: { account_number: data_input.account_number } })

        if (account_input && account_input.success == true && account_input.attribute_data && account_input.attribute_data.length > 0) {

            let account_value_input = account_input.attribute_data[0].account_value;


            let account_output = await db.find({ model: mod, data: { account_number: data_output.account_number } })

            if (account_output && account_output.success == true && account_output.attribute_data && account_output.attribute_data.length > 0) {
                //update account_value trong tai khoan output

                let account_value_output = account_output.attribute_data[0].account_value + data_input.account_value;

                let attribute_data = { data_up: { account_number: data_output.account_number }, data_down: { account_value: account_value_output } }

                let account_output_update = await db.updateMany({ model: mod, data: attribute_data })
                if (account_output_update && account_output_update.success == true) {
                    // trừ tiền tài khoản gửi
                    let account_value_update_2 = account_value_input - data_input.account_value;

                    let attribute_data_2 = { data_up: { account_number: data_input.account_number }, data_down: { account_value: account_value_update_2 } }
                    await db.updateMany({ model: mod, data: attribute_data_2 })
                }
                return account_output_update;

            } else {
                //khong tim thay tai khoan output
                return { success: false }
            }
        } else {
            //khong tim thay tai khoan input
            return { success: false }
        }

        return { success: true }
    }
};