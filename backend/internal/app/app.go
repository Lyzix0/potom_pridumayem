package app

import (
	"fmt"

	"github.com/potom_pridumaem/config"
	"github.com/potom_pridumaem/pkg/httpserver"
	"github.com/potom_pridumaem/pkg/logger"
)

func Run(cfg *config.Config) {
	lgr, err := logger.NewLogger(*cfg)
	if err != nil {
		panic(fmt.Sprintf("Init logger error: %s", err))
	}

	httpServer := httpserver.NewServer(lgr.Logger)
	httpServer.Start()
	httpServer.WaitForShutdown(*lgr.Logger)
}
