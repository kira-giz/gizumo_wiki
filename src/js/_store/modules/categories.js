import axios from '@Helpers/axiosDefault';

export default {
  namespaced: true,
  state: {
    loading: false,
    errorMessage: '',
    doneMessage: '',
    categoryList: [],
    deleteCategoryId: null,
    deleteCategoryName: '',
    updateCategoryId: null,
    updateCategoryName: '',
  },
  getters: {
    categoryList: state => state.categoryList,
    updateCategoryId: state => state.updateCategoryId,
    updateCategoryName: state => state.updateCategoryName,
  },
  actions: {
    clearMessage({ commit }) {
      commit('clearMessage');
    },
    getAllCategories({ commit, rootGetters }) {
      commit('toggleLoading');
      axios(rootGetters['auth/token'])({
        method: 'GET',
        url: '/category',
      }).then(({ data }) => {
        commit('toggleLoading');
        const { categories } = data;
        commit('doneGetAllCategories', { categories });
      }).catch(({ message }) => {
        commit('toggleLoading');
        commit('failFetchCategory', { message });
      });
    },
    editedCategory({ commit }, categoryName) {
      commit('editedCategoryName', categoryName);
    },
    setDeleteCategory({ commit }, { categoryId, categoryName }) {
      commit('setDeleteCategory', { categoryId, categoryName });
    },
    getCategory({ commit, getters }, updateCategoryId) {
      const category = getters.categoryList.find(item => item.id === updateCategoryId);
      const { id: categoryId, name: categoryName } = category;
      commit('doneGetCategory', { categoryId, categoryName });
    },
    updateCategory({ commit, getters, rootGetters }) {
      commit('toggleLoading');
      const data = new URLSearchParams();
      data.append('id', getters.updateCategoryId);
      data.append('name', getters.updateCategoryName);
      axios(rootGetters['auth/token'])({
        method: 'PUT',
        url: `/category/${getters.updateCategoryId}`,
        data,
      }).then(() => {
        commit('toggleLoading');
        commit('doneUpdateCategory');
      }).catch(({ message }) => {
        commit('toggleLoading');
        commit('failFetchCategory', { message });
      });
    },
    postCategory({ commit, rootGetters }, categoryName) {
      return new Promise((resolve, reject) => {
        commit('toggleLoading');
        const data = new URLSearchParams();
        data.append('name', categoryName);
        axios(rootGetters['auth/token'])({
          method: 'POST',
          url: '/category',
          data,
        }).then(() => {
          commit('toggleLoading');
          commit('donePostCategory');
          resolve();
        }).catch((err) => {
          commit('toggleLoading');
          commit('failFetchCategory', { message: err.message });
          reject();
        });
      });
    },
    deleteCategory({ commit, rootGetters }, categoryId) {
      return new Promise((resolve, reject) => {
        axios(rootGetters['auth/token'])({
          method: 'DELETE',
          url: `/category/${categoryId}`,
        }).then(({ data }) => {
          // NOTE: エラー時はresponse.data.codeが0で返ってくる。
          if (data.code === 0) throw new Error(data.message);
          commit('doneDeleteCategory');
          resolve();
        }).catch(({ message }) => {
          commit('failFetchCategory', { message });
          reject();
        });
      });
    },
  },
  mutations: {
    clearMessage(state) {
      state.errorMessage = '';
      state.doneMessage = '';
    },
    doneGetAllCategories(state, { categories }) {
      state.categoryList = [...categories];
    },
    failFetchCategory(state, { message }) {
      state.errorMessage = message;
    },
    setDeleteCategory(state, { categoryId, categoryName }) {
      state.deleteCategoryId = categoryId;
      state.deleteCategoryName = categoryName;
    },
    toggleLoading(state) {
      state.loading = !state.loading;
    },
    doneGetCategory(state, { categoryId, categoryName }) {
      state.updateCategoryId = categoryId;
      state.updateCategoryName = categoryName;
    },
    donePostCategory(state) {
      state.doneMessage = 'カテゴリーの追加が完了しました。';
    },
    doneUpdateCategory(state) {
      state.doneMessage = 'カテゴリーの更新が完了しました。';
    },
    doneDeleteCategory(state) {
      state.deleteCategoryId = null;
      state.deleteCategoryName = '';
      state.doneMessage = 'カテゴリーの削除が完了しました。';
    },
  },
};
