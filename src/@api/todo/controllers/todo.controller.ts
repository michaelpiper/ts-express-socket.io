import { TodoService } from '../services/todo.service.js'
import { SuccessArtifact } from '../../../responses/artifacts/success.artifact.js'
import { RedisPlugin } from '../../../common/plugins/redis.plugin.js'
import { validator } from '../../../utils/validator.util.js'
import zeroant from '../../../loaders/zeroant.js'
import { CacheManagerPlugin } from '../../../common/plugins/cacheManger.plugin.js'
import { TtlUtils } from '../../../utils/ttl.util.js'
import { BadRequest } from '../../../responses/clientErrors/badRequest.clientError.js'
import { ErrorCode, ErrorDescription } from '../../../common/constants.js'
import { logger } from '../../../common/logger/console.js'
import { SocketServer } from '../../../common/servers/socket.server.js'
import { type Request, type Response } from 'express'
export class TodoApiController {
  store = async (req: Request, res: Response) => {
    validator(req)
    const { task, isCompleted } = req.body
    const socket = zeroant.getServer(SocketServer).instance
    const redis = zeroant.plugin.get(RedisPlugin)
    const todoService = new TodoService(socket, redis)
    const newTodo = await todoService.storeTodoToModel(task, isCompleted)
    if (newTodo == null) {
      throw new BadRequest(ErrorCode.INVALID_INPUT, ErrorDescription.INVALID_INPUT, 'Can not create todo list')
    }
    const successResponse = new SuccessArtifact(newTodo).toJson
    return res.status(200).json(successResponse)
  }

  list = async (req: Request, res: Response) => {
    const socket = zeroant.getServer(SocketServer).instance
    const redis = zeroant.plugin.get(RedisPlugin)
    const todoService = new TodoService(socket, redis)
    const cacheManager = zeroant.plugin.get(CacheManagerPlugin)
    await cacheManager.del('new-todo')
    const todoLists = await cacheManager.withStrategy(async () => todoService.getSampleList()).cacheOrAsync('new-todo', TtlUtils.oneSecond)
    logger.info('todoLists', todoLists)
    const successResponse = new SuccessArtifact(todoLists).toJson
    return res.status(200).json(successResponse)
  }
}
