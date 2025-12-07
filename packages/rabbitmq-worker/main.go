package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"gdash-weather-challenge/rabbitmq-worker/api"
	"gdash-weather-challenge/rabbitmq-worker/config"
	"gdash-weather-challenge/rabbitmq-worker/worker"
)

func main() {
	log.Println("Iniciando RabbitMQ Worker...")

	// Dummy HTTP server for Render
	go func() {
		port := os.Getenv("PORT")
		if port == "" {
			port = "8080"
		}
		log.Printf("Iniciando servidor HTTP dummy na porta %s", port)
		http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("Worker is running"))
		})
		if err := http.ListenAndServe(":"+port, nil); err != nil {
			log.Printf("Erro no servidor HTTP dummy: %v", err)
		}
	}()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cfg := config.Load()

	processor := worker.NewProcessor()
	apiClient := api.NewClient(cfg)

	w := worker.NewWorker(cfg, processor, apiClient)
	defer w.Close()

	if err := w.Connect(); err != nil {
		log.Fatalf("Erro conectando: %v", err)
	}

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	errChan := make(chan error, 1)
	go func() {
		errChan <- w.StartConsuming(ctx)
	}()

	select {
	case err := <-errChan:
		if err != nil {
			log.Printf("Erro no worker: %v", err)
		}
	case sig := <-sigChan:
		log.Printf("Recebido sinal %v, encerrando gracefulmente...", sig)
		cancel()

		log.Println("Aguardando finalização das mensagens em processamento...")
		time.Sleep(5 * time.Second)
	}

	log.Println("Worker encerrado com sucesso")
}
