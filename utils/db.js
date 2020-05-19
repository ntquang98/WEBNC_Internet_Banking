
module.exports = {
  insert: ({ model: model, data: data }) => new Promise(async (resolve, reject) => {
    model.collection.insertMany(data)
      .then(data => {
        resolve({ success: true })
      })
      .catch(err => {
        console.log(err);
        reject({ success: false, error_msgs: err })
      })
  }),

  find: ({ model: model, data: data }) => new Promise(async (resolve, reject) => {
    model.find(data || {})
      .exec()
      .then(data => {
        if (data) {
          resolve({ success: true, attribute_data: data })
        }
      })
      .catch(err => {
        reject({ success: false, error_msgs: err })
      })
  }),

  updateOne: ({ model: model, data: data }) => new Promise(async (resolve, reject) => {

    model.updateOne({ _id: data.id }, { $set: data.data })
      .exec()
      .then(data => {
        if (data) {
          resolve({ success: true })
        }
      }).catch(err => {
        reject({ success: false, error_msgs: err })
      })
  }),

  updateMany: ({ model: model, data: data }) => new Promise(async (resolve, reject) => {

    model.updateMany(data.data_up, { $set: data.data_down })
      .exec()
      .then(data => {
        if (data) {
          resolve({ success: true })
        }
      }).catch(err => {
        reject({ success: false, error_msgs: err })
      })
  }),

  deleteOne: ({ model: model, data: data }) => new Promise(async (resolve, reject) => {
    model.deleteOne(data)
      .exec()
      .then(data => {
        if (data) {
          resolve({ success: true })
        } else resolve({ success: false })
      })
      .catch(err => {
        reject({ success: false, error_msgs: err })
      })
  }),

  deleteMany: ({ model: model, data: data }) => new Promise(async (resolve, reject) => {
    model.deleteMany(data)
      .exec()
      .then(data => {
        if (data) {
          resolve({ success: true })
        }
      })
      .catch(err => {
        reject({ success: false, error_msgs: err })
      })
  })
};