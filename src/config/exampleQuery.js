{
    attribute_query:[
        {   
            //cú pháp mở rộng => chưa sử dụng
			"input":[
                {
                    "model": "taikhoan",
                    "data": {"account_id": "001"}
                },
                {
                    "model": "user",
                    "data": {"user_id": "001"}
                },
                
            ],
            "output":[
                {
                    "model": "tranfer_history"
                }
            ]
        },
        // tìm kiếm danh sách lịch sử giao dịch của một tài khoản
        {
			"input":[
                {
                    "model": "taikhoan",
                    "data": {"account_id": "001"} // khóa ngoại của 2 bảng
                }
            ],
            "output":[
                {
                    "model": "tranfer_history"
                }
            ]
        },
        // tìm kiếm danh sách tài khoản của 1 user
        {
			"input":[
                {
                    "model": "user",
                    "data": {"user_id": "001"} // khóa ngoại của 2 bảng
                }
            ],
            "output":[
                {
                    "model": "taikhoan"
                }
            ]
		}
    ]
}
