new Vue({
    el: '#app',
    data: {
        products: [],
        pagination: {},
        tempProduct: {
            imageUrl: [],
        },
        isNew: false,
        status: {
            fileUploading: false,
        },
        user: {
            apipath: 'https://course-ec-api.hexschool.io/api',
            uuid: '53e0672b-2090-45df-a2bf-db5af28f0fcb',
            token: '',
        },
    },
    methods: {
        // 取得所有產品
        getProducts(page = 1) {
            // 此串URL後面的?page= 為顯示分頁
            const api = `${this.user.apipath}/${this.user.uuid}/admin/ec/products?page=${page}`;
            // 帶入Token
            axios.defaults.headers.common.Authorization = `Bearer ${this.user.token}`;

            axios.get(api)
                .then((res) => {
                    //console.log(res);
                    this.products = res.data.data; // 產品列表
                    this.pagination = res.data.meta.pagination; // 分頁資訊
                })
                .catch((err) => {
                    console.log(err);
                });
        },

        // Modal視窗切換
        openModal(isNew, item) {
            switch (isNew) {
                // 新產品先清空暫存資料
                case 'new':
                    this.tempProduct = {
                        imageUrl: [],
                    };
                    this.isNew = true;
                    $('#productModal').modal('show');
                    break;

                // 編輯產品需先取得產品詳細資訊
                case 'edit':
                    this.getProduct(item.id);
                    this.isNew = false;
                    break;

                // 刪除產品
                case 'delete':
                    this.tempProduct = Object.assign({}, item);
                    $('#delProductModal').modal('show');
                    break;
                default:
                    break;
            }
        },

        // 取得單一產品詳細內容
        getProduct(id) {
            const api = `${this.user.apipath}/${this.user.uuid}/admin/ec/product/${id}`;
            axios.get(api)
                .then((res) => {
                    this.tempProduct = res.data.data;
                    $('#productModal').modal('show');
                })
                .catch((err) => {
                    console.log(err);
                })
        },

        // 新增產品
        updateProduct() {
            // 新增產品
            let api = `${this.user.apipath}/${this.user.uuid}/admin/ec/product`;
            let httpMethod = 'post';

            // 若不是新產品則編輯
            if (!this.isNew) {
                api = `${this.user.apipath}/${this.user.uuid}/admin/ec/product/${this.tempProduct.id}`;
                httpMethod = 'patch';
            }

            // 帶入Token
            axios.defaults.headers.common.Authorization = `Bearer ${this.user.token}`;

            axios[httpMethod](api, this.tempProduct)
                .then(() => {
                    $('#productModal').modal('hide'); // AJAX 新增成功後關閉 Modal
                    this.getProducts(); // 重新取得全部產品資料
                })
                .catch((err) => {
                    console.log(err);
                });
        },

        // 新增圖片
        uploadFile() {
            const uploadFile = this.$refs.file.files[0];
            const formData = new FormData();
            formData.append('file', uploadFile);
            const url = `${this.user.apipath}/${this.user.uuid}/admin/storage`;
            this.status.fileUploading = true;

            axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }).then((res) => {
                this.status.fileUploading = false;
                if (res.status === 200) {
                    this.tempProduct.imageUrl.push(res.data.data.path);
                }
            }).catch(() => {
                console.log('上傳檔案大小不可以超過 2 MB');
                this.status.fileUploading = false;
            });
        },

        // 刪除產品
        deldelProduct() {
            const url = `https://course-ec-api.hexschool.io/api/${this.user.uuid}/admin/ec/product/${this.tempProduct.id}`;

            // 帶入Token
            axios.defaults.headers.common.Authorization = `Bearer ${this.user.token}`;

            axios.delete(url)
                .then(() => {
                    $('#delProductModal').modal('hide');
                    this.getProducts();
                });
        }
    },
    created() {
        // 在Cookies中取得Token
        this.user.token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        // 如果取得Token失敗 就跳回登入畫面
        if (this.user.token === "") {
            window.location = 'login.html';
        }
        // 取得所有產品
        this.getProducts();
    },
})