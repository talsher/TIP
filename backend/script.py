import sys
import tempfile
from xml.etree import ElementTree
from copy import deepcopy

import numpy as np
import cv2
import os
from random import shuffle
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.optimizers import *
import matplotlib.pyplot as plt
import json
import traceback

IMG_SIZE = (100, 50)
INPUT_SHAPE = (100, 50, 3)

model = sys.argv[1]
page_path = sys.argv[2]
xml_path = sys.argv[3]
model_file = sys.argv[4]
pretrain_word_file = sys.argv[5]

def extract_img(point_array, img, id, target_dir):
    ' copy polygon from image to target_dir, filename will be <id>.png '
    # load np array of points
    pts = np.array(point_array, dtype=np.int32)

    topleft = pts.min(axis=0)
    bottomright = pts.max(axis=0)

    blank_image = img[topleft[1]:bottomright[1], topleft[0]:bottomright[0]]
    blank_image = cv2.resize(blank_image, IMG_SIZE)

    path = os.path.join(target_dir, "{}.png".format(id))
    cv2.imwrite(path, blank_image)
    return path


def parse_coordes(coords_str):
    res = []

    for point in coords_str.split(' '):
        tmp_point = point.split(',')
        x = int(tmp_point[0])
        y = int(tmp_point[1])
        res.append([x, y])
    return res

def split_page(page_path, xml_path, target_dir):
    '''
    Split page into images according to xml, save in tmp folder
    return result dictionary:
    {
        transcription: [img_src1, ...]
    }
    '''

    page_img = cv2.imread(page_path, 0)
    if page_img is None:
        print("bad img")
        return {}

    ' parse the xml file, return result json '
    # print("parsing: {}".format(xml_path))
    xml_iter = ElementTree.iterparse(xml_path, events={'start', 'end'})
    res_dict = {}

    word_id = ''
    coords = []
    word_transcription = ''



    for event, elem in xml_iter:
        if event == 'start':
            if elem.tag.endswith('Word'):
                word_id = elem.attrib['id']
            if elem.tag.endswith('Coords'):
                coords = parse_coordes(elem.attrib['points'])

        if event == 'end':
            if elem.tag.endswith('Unicode'):
                if not elem.text:
                    #print("no text in: {}".format(word_id))
                    word_transcription = ""
                else:
                    word_transcription = elem.text.strip()
            if elem.tag.endswith('Word'):
                if word_transcription and word_transcription != '':
                    extracted_img = extract_img(coords, page_img, word_id, tmp_dir)
                    if word_transcription not in res_dict.keys():
                        res_dict[word_transcription] = [extracted_img]
                    else:
                        res_dict[word_transcription].append(extracted_img)
                word_id = ''
                coords = []
                word_transcription = ''

            elem.clear()


    return res_dict

def make_labels(json_data, pretrain_words):
    ' get data from xml and words that was trained before return dict: [word]=class '
    label_data = {}
    word_ordered_list = list(pretrain_words)
    pretrain_words_len = len(pretrain_words)
    arr_size = len(set(json_data.keys()) | set(pretrain_words))

    for i, word in enumerate(pretrain_words):
        tmp_arr = [0]*arr_size
        tmp_arr[i] = 1
        label_data[word] = np.array(tmp_arr)

    i = 0
    for key in json_data.keys():
        # skip words that loaded from pretrained words
        if key in label_data:
            continue
        tmp_arr = [0]*arr_size
        tmp_arr[i + pretrain_words_len] = 1
        label_data[key] = np.array(tmp_arr)
        word_ordered_list.append(key)
        i = i + 1

    return label_data, word_ordered_list


def get_label(result_arr, lable_data):
    for key in lable_data:
        if lable_data[key] == result_arr:
            return key
    raise Exception("no lable for the arr")


def img_data_with_label(data_json, pretrain_words=[]):
    ' get data from xml and words that was trained before and return list of pairs - (class, img) for train'
    label_json, word_ordered_list = make_labels(data_json, pretrain_words)
    train_imgs = []

    for label in data_json:
        for img_src in data_json[label]:
            img_path = img_src
            img = cv2.imread(img_path, cv2.IMREAD_COLOR)
            train_imgs.append([np.array(img), label_json[label]])   

    shuffle(train_imgs)

    return word_ordered_list, train_imgs

def get_model_by_name(name, num_classes):
    if name == 'vgg16':
        return keras.applications.vgg16.VGG16(include_top=True, weights=None, input_tensor=None, input_shape=INPUT_SHAPE, pooling=None, classes=num_classes)
    elif name == 'vgg19':
        return keras.applications.vgg19.VGG19(include_top=True, weights=None, input_tensor=None, input_shape=INPUT_SHAPE, pooling=None, classes=num_classes)
    else:
        raise Exception('bad model')
try:
    EP = 1
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

    tmp_dir = tempfile.mkdtemp()
    res = split_page(page_path, xml_path, tmp_dir)

    with open(pretrain_word_file) as data_file:    
        pretrain_words = json.load(data_file)

    classes_data, dataset = img_data_with_label(res, pretrain_words)
    train_num = round(len(dataset)*0.8)
    train_set = dataset[:train_num]
    validation_set = dataset[-1*(len(dataset) - train_num):]

    tr_img_data = np.array([i[0] for i in train_set]).reshape(-1,100,50,3)
    tr_label_data = np.array([i[1] for i in train_set])

    test_img_data = np.array([i[0] for i in validation_set]).reshape(-1,100,50,3)
    test_label_data = np.array([i[1] for i in validation_set])

    num_classes = tr_label_data.shape[1]

    datagen = keras.preprocessing.image.ImageDataGenerator(
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=False)


    
    if model_file != '':
        model = get_model_by_name(model, len(pretrain_words))
        model.load_weights(model_file)
        if pretrain_word_file != '':
            model.layers.pop()
            base_model_layers = model.output
            pred = keras.layers.Dense(num_classes, activation='softmax')(base_model_layers)
            model = keras.models.Model(inputs=model.input, outputs=pred)
    else:
        model = get_model_by_name(model, num_classes)


    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    # model.fit(x=tr_img_data, y=tr_label_data, epochs=1, batch_size=100)
    history = model.fit_generator(datagen.flow(tr_img_data, tr_label_data, batch_size=32), verbose=0, steps_per_epoch=len(tr_img_data) / 32, epochs=EP, validation_data=(test_img_data, test_label_data))
    
    # save model
    new_model_file = tempfile.mktemp() + '.h5'
    model.save_weights(new_model_file)
    print(new_model_file)


    x_axis = range(1, EP + 1)
    # summarize history for accuracy
    plt.subplot(221)
    plt.plot(x_axis, history.history['acc'])
    plt.plot(x_axis, history.history['val_acc'])
    plt.title('model accuracy')
    plt.ylabel('accuracy')
    plt.xlabel('epoch')
    plt.legend(['train', 'test'], loc='upper left')
    plt.ylim(top=1, bottom=0)
    plt.xlim(right=EP, left=0)
    plt.xticks(range(0,EP))

    # summarize history for loss
    plt.subplot(222)
    plt.plot(x_axis, history.history['loss'])
    plt.plot(x_axis, history.history['val_loss'])
    plt.title('model loss')
    plt.ylabel('loss')
    plt.xlabel('epoch')
    plt.legend(['train', 'test'], loc='upper left')
    plt.ylim(bottom=0)
    plt.xlim(right=EP, left=0)
    plt.xticks(range(0,EP))

    loss_plot_file = tempfile.mktemp() + ".png"
    plt.savefig(loss_plot_file)
    print(loss_plot_file)

    classes_data_file = tempfile.mktemp() + ".json"
    # turn all nparray to json
    with open(classes_data_file, 'w') as outfile:
        json.dump(classes_data, outfile)
    print(classes_data_file)

except Exception as e:
    traceback.print_exc()
    print("got exception:\n{}".format(e))
    exit(1)