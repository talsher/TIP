
export interface PageMetadata {
    id: String;
    name: String;
};

export interface PageView {
    name: String,
    models: ModelMetadata[],
    archi_list: String[]

};

export interface ModelMetadata {
    id: String,
    name: String,
    archi: String
};

export interface ModelTrainResult {
    model_id: String,
    train_img: any
};