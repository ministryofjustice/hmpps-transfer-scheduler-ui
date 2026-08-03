import { RequestHandler } from 'express'
import DocumentGenerationService from '../../services/apis/documentGenerationService'

export const populateDocumentTemplate = (documentGenerationService: DocumentGenerationService): RequestHandler => {
  return async (req, res, next) => {
    if (!req.method.match(/GET/i)) {
      return next()
    }

    const { templates } = await documentGenerationService.getTemplatesForGroup({ res }, 'TEMPORARY_ABSENCE')
    const transferChecklist = templates.find(({ code }) => code === 'TAP_TXCHKL_V1_1')

    if (!transferChecklist) {
      return res.notFound()
    }

    req.middleware ??= {}
    req.middleware.documentTemplateId = transferChecklist.id

    return next()
  }
}
