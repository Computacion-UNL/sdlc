'use strict'

const Setting = require('../models/setting.model');
const SettingController = {};

// Crear o actualizar configuración
SettingController.createOrUpdateSetting = (req, res) => {
  Setting.findOneAndUpdate({ slug: req.params.slug }, { ...req.body }, { upsert: true, new: true })
    .then((setting) => {
      if (!setting) {
        return res.status(500).send({ msg: 'No se puedo registrar la configuración' });
      } else {
        return res.status(200).send({ setting: setting });
      }
    })
    .catch(err => {
      console.log('Error' + err);
      return res.status(500).send({ msg: 'Error al registrar configuración' });
    });
}

// Obtener todas las configuraciones
SettingController.getAllSettings = (req, res) => {
  Setting.find({})
    .then((settings) => {
      return res.status(200).send(settings);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ msg: 'Error al devolver configuraciones' });
    });
}

// Obtener configuración por slug
SettingController.getSettingBySlug = (req, res) => {
  Setting.findOne({ slug: req.params.slug })
    .then((setting) => {
      return res.status(200).send(setting);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).send({ msg: 'Error al devolver configuración' });
    });
}

module.exports = SettingController;