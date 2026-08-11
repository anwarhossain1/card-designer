import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UseGuards,
} from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";
import {
  CurrentRequester,
  type Requester,
} from "../../common/decorators/requester.decorator";
import { GuestIdentityGuard } from "../../common/guards/guest-identity.guard";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  documentIdSchema,
  saveDesignSchema,
  type SaveDesignInput,
} from "./design.dto";
import { DesignsService } from "./designs.service";

const idPipe = new ZodValidationPipe(documentIdSchema);

/**
 * `@Public()` here means "a session is optional", not "anyone may read this":
 * it stops the global guard rejecting requests without one, and the guest
 * guard then supplies an identity so ownership still decides what is visible.
 */
@Public()
@UseGuards(GuestIdentityGuard)
@Controller("designs")
export class DesignsController {
  constructor(private readonly designs: DesignsService) {}

  @Get()
  list(@CurrentRequester() requester: Requester) {
    return this.designs.list(requester);
  }

  @Get(":documentId")
  find(
    @CurrentRequester() requester: Requester,
    @Param("documentId", idPipe) documentId: string,
  ) {
    return this.designs.find(requester, documentId);
  }

  /** Upsert, because the editor autosaves a document it already has an id for. */
  @Put(":documentId")
  save(
    @CurrentRequester() requester: Requester,
    @Param("documentId", idPipe) documentId: string,
    @Body(new ZodValidationPipe(saveDesignSchema)) body: SaveDesignInput,
  ) {
    return this.designs.save(requester, documentId, body);
  }

  @Delete(":documentId")
  remove(
    @CurrentRequester() requester: Requester,
    @Param("documentId", idPipe) documentId: string,
  ) {
    return this.designs.remove(requester, documentId);
  }
}
